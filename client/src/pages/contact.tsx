import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, MessageCircle, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface ContactData {
  [key: string]: { value: string; isActive: boolean };
}

export default function ContactPage() {
  const { isLoading: authLoading } = useAuth();

  const { data: contactData, isLoading: contactsLoading } = useQuery<ContactData>({
    queryKey: ["/api/contact"],
  });

  if (authLoading || contactsLoading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6">
        <Skeleton className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const phoneContact = contactData?.phone?.isActive ? { value: contactData.phone.value, label: "Phone" } : null;
  const emailContact = contactData?.email?.isActive ? { value: contactData.email.value, label: "Email" } : null;
  const whatsappContact = contactData?.whatsapp?.isActive ? { value: contactData.whatsapp.value, label: "WhatsApp" } : null;
  const telegramContact = contactData?.telegram?.isActive ? { value: contactData.telegram.value, label: "Telegram" } : null;
  
  const hasAnyContact = phoneContact || emailContact || whatsappContact || telegramContact;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="text-zinc-600 dark:text-zinc-400"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-orange-500">Contact Us</h1>
        </div>

        <Card className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 mb-6">
          <CardContent className="p-4 text-center">
            <Phone className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-white font-bold text-lg">Get in Touch</p>
            <p className="text-white/80 text-sm">We're here to help you</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {phoneContact && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 border-green-400 bg-white dark:bg-zinc-900">
                <CardContent className="p-4">
                  <a 
                    href={`tel:${phoneContact.value}`}
                    className="flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                        {phoneContact.label || "Phone"}
                      </p>
                      <p className="text-green-600 dark:text-green-400">
                        {phoneContact.value}
                      </p>
                    </div>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {emailContact && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-2 border-blue-400 bg-white dark:bg-zinc-900">
                <CardContent className="p-4">
                  <a 
                    href={`mailto:${emailContact.value}`}
                    className="flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                        {emailContact.label || "Email"}
                      </p>
                      <p className="text-blue-600 dark:text-blue-400">
                        {emailContact.value}
                      </p>
                    </div>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {whatsappContact && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 border-emerald-400 bg-white dark:bg-zinc-900">
                <CardContent className="p-4">
                  <a 
                    href={`https://wa.me/${whatsappContact.value.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                        {whatsappContact.label || "WhatsApp"}
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-400">
                        {whatsappContact.value}
                      </p>
                    </div>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {telegramContact && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="border-2 border-sky-400 bg-white dark:bg-zinc-900">
                <CardContent className="p-4">
                  <a 
                    href={`https://t.me/${telegramContact.value.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
                      <Send className="w-6 h-6 text-sky-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                        {telegramContact.label || "Telegram"}
                      </p>
                      <p className="text-sky-600 dark:text-sky-400">
                        {telegramContact.value}
                      </p>
                    </div>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!hasAnyContact && (
            <Card className="border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
              <CardContent className="p-8 text-center">
                <Phone className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                <p className="text-zinc-500 dark:text-zinc-400">
                  Contact information not available yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}
