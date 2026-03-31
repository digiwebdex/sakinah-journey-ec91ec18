import { useSiteContent } from "@/hooks/useSiteContent";
import { useLanguage } from "@/i18n/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

export default function TermsConditions() {
  const { data: content } = useSiteContent("terms_conditions");
  const { language } = useLanguage();
  const lc = content?.[language] || content?.bn || {};

  const title = lc?.title || "শর্তাবলী";
  const lastUpdated = content?.last_updated || "২০২৬-০৩-২৬";
  const sections: { heading: string; body: string }[] = lc?.sections || [
    {
      heading: "সাধারণ শর্তাবলী",
      body: "মানাসিক ট্রাভেল হাব-এর সেবা গ্রহণ করার মাধ্যমে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন। আমাদের সকল সেবা বাংলাদেশের প্রচলিত আইন অনুসারে পরিচালিত হয়।"
    },
    {
      heading: "বুকিং ও পেমেন্ট",
      body: "বুকিং নিশ্চিত করতে ন্যূনতম ৫০% অগ্রিম পেমেন্ট প্রদান করতে হবে। সম্পূর্ণ পেমেন্ট যাত্রার কমপক্ষে ১৫ দিন আগে পরিশোধ করতে হবে। পেমেন্ট ব্যাংক ট্রান্সফার, বিকাশ, নগদ বা ক্যাশের মাধ্যমে করা যাবে।"
    },
    {
      heading: "ভিসা প্রসেসিং",
      body: "ভিসা আবেদন ও প্রসেসিং সংশ্লিষ্ট দেশের দূতাবাসের নিয়ম অনুসারে পরিচালিত হয়। ভিসা প্রত্যাখ্যানের ক্ষেত্রে মানাসিক ট্রাভেল হাব দায়ী নয়, তবে পুনরায় আবেদনে সহায়তা প্রদান করা হবে। ভিসা ফি অফেরতযোগ্য।"
    },
    {
      heading: "যাত্রা বাতিল ও পরিবর্তন",
      body: "যাত্রার ৩০ দিন আগে বাতিল করলে ১০% চার্জ কাটা হবে। ১৫-৩০ দিন আগে বাতিল করলে ২৫% চার্জ কাটা হবে। ১৫ দিনের কম সময়ে বাতিল করলে ৫০% চার্জ কাটা হবে। যাত্রার তারিখে বা পরে বাতিল করলে কোনো রিফান্ড প্রদান করা হবে না।"
    },
    {
      heading: "হোটেল ও পরিবহন",
      body: "প্যাকেজে উল্লেখিত হোটেল ও পরিবহন সুবিধা প্রদান করা হবে। তবে অপ্রত্যাশিত পরিস্থিতিতে সমমানের বিকল্প ব্যবস্থা করা হতে পারে। হোটেলের রুম বরাদ্দ হোটেল কর্তৃপক্ষের সিদ্ধান্ত অনুযায়ী হবে।"
    },
    {
      heading: "দায়িত্ব সীমাবদ্ধতা",
      body: "প্রাকৃতিক দুর্যোগ, রাজনৈতিক অস্থিরতা, এয়ারলাইন্সের সময়সূচি পরিবর্তন বা অন্যান্য অনিয়ন্ত্রিত কারণে সেবা প্রদানে বিলম্ব বা পরিবর্তনের জন্য মানাসিক ট্রাভেল হাব দায়ী থাকবে না।"
    },
    {
      heading: "অভিযোগ ও সমাধান",
      body: "যেকোনো অভিযোগ যাত্রা শেষ হওয়ার ৭ দিনের মধ্যে লিখিতভাবে জানাতে হবে। আমরা সকল অভিযোগ যথাসম্ভব দ্রুত সমাধানের চেষ্টা করব।"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">সর্বশেষ আপডেট: {lastUpdated}</p>
          </div>
        </div>
        <div className="space-y-8">
          {sections.map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">{i + 1}. {s.heading}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
