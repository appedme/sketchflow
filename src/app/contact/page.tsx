import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Have questions, feedback, or need support? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                Contact Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Mail className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Email</p>
                    <a 
                      href="mailto:mail@sketchflow.space" 
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      mail@sketchflow.space
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                What can we help you with?
              </h3>
              <ul className="space-y-2 text-slate-600">
                <li>- General questions about SketchFlow</li>
                <li>- Technical support and troubleshooting</li>
                <li>- Feature requests and feedback</li>
                <li>- Partnership and collaboration inquiries</li>
                <li>- Bug reports and issues</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Response Time
              </h3>
              <p className="text-slate-600">
                We typically respond to all inquiries within 24 hours during business days. 
                For urgent technical issues, please include "URGENT" in your subject line.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Send us a Message
            </h2>
            
            {/* Tally Form Embed */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <iframe
                src="https://tally.so/embed/n0qO8y?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                width="100%"
                height="600"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Contact Form"
                className="min-h-[600px]"
              />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Prefer to reach out directly?
            </h3>
            <p className="text-slate-600 mb-4">
              You can also email us directly at{" "}
              <a 
                href="mailto:mail@sketchflow.space" 
                className="text-slate-900 font-medium hover:underline"
              >
                mail@sketchflow.space
              </a>
            </p>
            <p className="text-sm text-slate-500">
              We're here to help you make the most of SketchFlow!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}