import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

export function FAQAccordion({ items, className = "" }: FAQAccordionProps) {
  return (
    <Accordion type="single" collapsible className={className}>
      {items.map((item, index) => (
        <AccordionItem 
          key={index} 
          value={`item-${index}`}
          className="border-b border-[hsl(var(--sp-gold)/0.3)]"
        >
          <AccordionTrigger 
            className="text-left py-4 hover:no-underline"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
          >
            {item.question}
          </AccordionTrigger>
          <AccordionContent 
            className="pb-4"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
