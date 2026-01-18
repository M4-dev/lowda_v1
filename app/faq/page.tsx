"use client";


import React, { useState } from "react";
import Container from "../components/container";
import Heading from "../components/heading";
import { ChevronDown } from "lucide-react";
import { appConfig } from "@/config/appConfig";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [openReturnIndex, setOpenReturnIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const toggleReturnFAQ = (index: number) => {
    setOpenReturnIndex(openReturnIndex === index ? null : index);
  };
  const faqs = appConfig.faqs;
  const returnsFaqs = appConfig.returnsFaqs;

  return (
    <div className="pt-8 pb-16">
      <Container>
        <div className="max-w-4xl mx-auto px-4">
          <Heading title="Frequently Asked Questions" center />
          <p className="text-center text-slate-600 mb-8">
            Find answers to common questions about ordering, delivery, and our services
          </p>

          {/* General FAQs */}
          <div className="space-y-4 mb-12">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-slate-300 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 flex justify-between items-center text-left hover:bg-slate-50 transition"
                >
                  <h3 className="text-lg font-semibold text-slate-800 pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`text-2xl text-slate-600 flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <p className="px-6 pb-6 text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Returns & Refunds Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">🔄</span>
              Returns & Refunds
            </h2>
            <div className="space-y-4">
              {returnsFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <button
                    onClick={() => toggleReturnFAQ(index)}
                    className="w-full p-6 flex justify-between items-center text-left hover:bg-blue-100/30 transition"
                  >
                    <h3 className="text-lg font-semibold text-blue-900 pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`text-2xl text-blue-700 flex-shrink-0 transition-transform duration-300 ${
                        openReturnIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openReturnIndex === index ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <p className="px-6 pb-6 text-slate-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-slate-100 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              Still have questions?
            </h3>
            <p className="text-slate-600">
              Can&apos;t find what you&apos;re looking for? Feel free to reach out to our
              customer service team.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default FAQPage;
