import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "How does Learnaz handle student data privacy?",
    answer: "Learnaz uses enterprise-grade encryption and follows FERPA and GDPR compliance standards. All student data is anonymized for analytics, stored securely, and only accessible to authorized personnel with proper credentials.",
  },
  {
    question: "Can I export student reports?",
    answer: "Yes! You can export comprehensive reports in multiple formats including PDF, Excel, and CSV. Reports can include attendance, grades, behavior records, and custom data fields that you configure.",
  },
  {
    question: "How is the monthly user limit calculated?",
    answer: "The monthly limit is based on active users - students, teachers, and parents who log in during the billing period. Inactive accounts don't count toward your limit, making it cost-effective for schools of any size.",
  },
  {
    question: "What happens when I reach my monthly user limit?",
    answer: "We'll notify you when you approach your limit. You can either upgrade your plan or remove inactive users. Your system continues to work, but new user registrations will be paused until the next billing cycle or plan upgrade.",
  },
  {
    question: "Which payment options are available?",
    answer: "We accept credit cards, debit cards, bank transfers, and purchase orders. Annual plans can also be paid via invoice with NET30 terms for qualified institutions.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Absolutely! You can change your plan at any time. Upgrades are instant, and you'll be credited for any unused time on downgrades. All your data and configurations remain intact during transitions.",
  },
  {
    question: "Do you have an affiliate program?",
    answer: "Yes! Our affiliate program offers competitive commissions for educational consultants, IT professionals, and partners who refer schools to Learnaz. Contact our partnership team for details.",
  },
];

const FAQSection = () => {
  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-background py-16 px-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-12">
  <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
    Answers to your most <span className="text-primary">important </span>questions
  </h2>
  <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
    Whether you’re a teacher, student, or administrator, we’ve covered the
    essentials to help you understand how our ERP system simplifies school
    management and daily operations.
  </p>
</div>


        <Accordion type="single" collapsible className="space-y-4">
          {faqData.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border border-border rounded-lg px-6 overflow-hidden"
            >
              <AccordionTrigger className="text-left text-foreground hover:no-underline py-6 [&[data-state=open]>svg]:rotate-45">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 pt-0">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection