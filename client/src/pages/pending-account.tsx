import { Button } from "@/components/ui/button";
import { Clock, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function PendingAccountPage() {
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center mb-6"
          >
            <Clock className="w-12 h-12 text-orange-500" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-3">
            Account Pending Activation
          </h1>
          
          <p className="text-gray-400 text-lg mb-2">
            Thank you for registering!
          </p>
          
          <p className="text-gray-500 text-sm leading-relaxed">
            Your account is currently under review. An administrator will activate your account shortly. 
            You will be able to log in once your account has been approved.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6 mb-6 border border-zinc-800">
          <h3 className="text-white font-semibold mb-4">What happens next?</h3>
          <ul className="text-left space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-500 text-xs font-bold">1</span>
              </span>
              <span>Admin will review your registration details</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-500 text-xs font-bold">2</span>
              </span>
              <span>Once approved, your account will be activated</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-500 text-xs font-bold">3</span>
              </span>
              <span>You can then log in and start earning rewards</span>
            </li>
          </ul>
        </div>

        <div className="bg-zinc-900/50 rounded-xl p-4 mb-6 border border-zinc-800">
          <p className="text-gray-400 text-sm mb-3">Need help? Contact support:</p>
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Mail className="w-4 h-4" />
              <span>support@odel.com</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 border-zinc-700 text-white hover:bg-zinc-800"
          data-testid="button-logout"
        >
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}
