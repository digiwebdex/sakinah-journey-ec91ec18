import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { phone, action, code } = body;

    if (!phone || typeof phone !== "string" || phone.length < 10 || phone.length > 15) {
      return new Response(JSON.stringify({ error: "Invalid phone number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedPhone = phone.replace(/[^\d+]/g, "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    if (action === "send") {
      // Rate limit: max 3 OTPs per phone in last 5 minutes
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("otp_codes")
        .select("*", { count: "exact", head: true })
        .eq("phone", sanitizedPhone)
        .gte("created_at", fiveMinAgo);

      if ((count || 0) >= 3) {
        return new Response(JSON.stringify({ error: "Too many OTP requests. Please wait 5 minutes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const otpCode = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      await supabase.from("otp_codes").insert({
        phone: sanitizedPhone,
        code: otpCode,
        expires_at: expiresAt,
      });

      // Send SMS
      const smsApiKey = Deno.env.get("BULKSMSBD_API_KEY");
      const smsSenderId = Deno.env.get("BULKSMSBD_SENDER_ID");

      if (!smsApiKey) {
        return new Response(JSON.stringify({ error: "SMS service not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const message = `Your RAHE KABA verification code is: ${otpCode}. Valid for 5 minutes.`;
      const smsUrl = `http://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(smsApiKey)}&type=text&number=${encodeURIComponent(sanitizedPhone)}&senderid=${encodeURIComponent(smsSenderId || "")}&message=${encodeURIComponent(message)}`;

      const smsRes = await fetch(smsUrl);
      console.log("SMS result:", await smsRes.text());

      return new Response(JSON.stringify({ success: true, message: "OTP sent successfully" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "verify") {
      if (!code || typeof code !== "string" || code.length !== 6) {
        return new Response(JSON.stringify({ error: "Invalid OTP code" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find valid OTP
      const { data: otpRecord } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("phone", sanitizedPhone)
        .eq("code", code)
        .eq("verified", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!otpRecord) {
        return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark as verified
      await supabase.from("otp_codes").update({ verified: true }).eq("id", otpRecord.id);

      // Find user by phone in profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("phone", sanitizedPhone)
        .single();

      if (!profile) {
        return new Response(JSON.stringify({ error: "No account found with this phone number. Please register first." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate a magic link / custom token for the user
      // We'll use admin API to generate a link
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: "", // We need the email
      });

      // Instead, get user email and sign them in
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id);

      if (!authUser?.user?.email) {
        return new Response(JSON.stringify({ error: "User account issue. Please contact support." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate a magic link for the user
      const { data: magicLink, error: magicError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: authUser.user.email,
      });

      if (magicError) {
        console.error("Magic link error:", magicError);
        return new Response(JSON.stringify({ error: "Authentication failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Return the token properties for client-side session creation
      return new Response(JSON.stringify({
        success: true,
        access_token: magicLink.properties?.access_token,
        refresh_token: magicLink.properties?.refresh_token,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use 'send' or 'verify'." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("OTP error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
