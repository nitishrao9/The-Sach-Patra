import { useState } from 'react';
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ContactSubmission } from '@/types';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Facebook,
  Youtube,
  Instagram,
  MessageSquare,
  User,
  Building,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { XIcon } from "@/components/icons/XIcon";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save to Firebase
      const contactData: Omit<ContactSubmission, 'id'> = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        type: formData.type as ContactSubmission['type'],
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'contacts'), contactData);

      alert('आपका संदेश सफलतापूर्वक भेज दिया गया है! हम जल्द ही आपसे संपर्क करेंगे।');
      setFormData({ name: '', email: '', subject: '', message: '', type: 'general' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('संदेश भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "ईमेल पता",
      value: "thesachpatra@gmail.com",
      description: "हमें ईमेल करें"
    },
    {
      icon: Phone,
      title: "फोन नंबर",
      value: "+91 8340458165",
      description: "सोमवार से शुक्रवार, 9:00 AM - 6:00 PM"
    },
    {
      icon: MapPin,
      title: "पता",
      value: "पटना , बिहार, 800001 ",
      description: " भारत"
    },
    {
      icon: Clock,
      title: "कार्य समय",
      value: "24/7 न्यूज़ कवरेज",
      description: "ऑफिस: सोम-शुक्र 9:00 AM - 6:00 PM"
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'सामान्य पूछताछ' },
    { value: 'news-tip', label: 'न्यूज़ टिप' },
    { value: 'feedback', label: 'फीडबैक' },
    { value: 'advertising', label: 'विज्ञापन' },
    { value: 'partnership', label: 'पार्टनरशिप' },
    { value: 'technical', label: 'तकनीकी सहायता' }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            संपर्क करें
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            हमसे जुड़ें और अपने सुझाव, प्रतिक्रिया या समाचार टिप साझा करें। हम आपकी बात सुनने के लिए तैयार हैं।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MessageSquare className="h-6 w-6 text-red-600" />
                  हमें संदेश भेजें
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        नाम *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="आपका पूरा नाम"
                        required
                        className="focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        ईमेल *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        required
                        className="focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Inquiry Type */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      पूछताछ का प्रकार
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {inquiryTypes.map((type) => (
                        <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value={type.value}
                            checked={formData.type === type.value}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">विषय *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="संदेश का विषय"
                      required
                      className="focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">संदेश *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="अपना संदेश यहाँ लिखें..."
                      rows={6}
                      required
                      className="focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        भेजा जा रहा है...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        संदेश भेजें
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                <CardTitle className="text-lg">संपर्क जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon;
                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{info.title}</h3>
                          <p className="text-sm font-medium text-red-600">{info.value}</p>
                          <p className="text-xs text-muted-foreground">{info.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardTitle className="text-lg">सोशल मीडिया</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  हमें सोशल मीडिया पर फॉलो करें और लेटेस्ट अपडेट पाएं
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="https://www.facebook.com/share/1a5dktsa1G/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  >
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Facebook</span>
                  </Link>
                  <Link
                    to="https://x.com/thesachpatra?s=11"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-900 rounded-lg transition-colors"
                  >
                    <XIcon className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                    <span className="text-sm font-medium">X (Twitter)</span>
                  </Link>
                  <Link
                    to="https://www.youtube.com/@thesachpatra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <Youtube className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium">YouTube</span>
                  </Link>
                  <Link
                    to="https://www.instagram.com/thesachpatra_official?igsh=YmdraTM0NTBlaWtt&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950 dark:hover:bg-pink-900 rounded-lg transition-colors"
                  >
                    <Instagram className="h-5 w-5 text-pink-600" />
                    <span className="text-sm font-medium">Instagram</span>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardTitle className="text-lg">त्वरित सुझाव</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <p className="text-sm">न्यूज़ टिप के लिए सबूत और विवरण शामिल करें</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <p className="text-sm">तकनीकी समस्या के लिए स्क्रीनशॉट भेजें</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <p className="text-sm">विज्ञापन के लिए अपना बजट और आवश्यकताएं बताएं</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
