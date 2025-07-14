import { Layout } from "@/components/layout/layout";

export default function AboutPage() {
  return (
    <Layout hideBreakingNews>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">About Us</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed mb-6">
            The Sachpatra is an independent digital news platform dedicated to delivering truthful, sharp, and meaningful journalism. We cover politics, society, culture, economy, and local stories — with clarity, credibility, and no compromise on facts.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            Our commitment: News that informs, not influences. Voices that matter. Stories that inspire.
          </p>

          <div className="border-t border-gray-200 my-8 pt-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-3">📬</span>
              Contact Us
            </h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🌐</span>
                <div>
                  <span className="font-semibold">Website:</span>
                  <span className="ml-2">www.thesachpatra.in</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xl">📧</span>
                <div>
                  <span className="font-semibold">Email:</span>
                  <a href="mailto:thesachpatra@gmail.com" className="ml-2 text-blue-600 hover:text-blue-800 underline">
                    thesachpatra@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}