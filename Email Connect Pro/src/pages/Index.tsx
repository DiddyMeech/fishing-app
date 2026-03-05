import { useState } from "react";
import { Mail } from "lucide-react";
import EmailLoginModal from "@/components/EmailLoginModal";

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -70, 0],
            y: [0, 70, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-40 -left-20 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute -bottom-40 left-1/3 w-80 h-80 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
        />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-2xl px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-white/50 backdrop-blur-md shadow-sm border border-white/20">
             <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Email Connect
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl font-light">
            The adaptive login experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <button
            onClick={() => setModalOpen(true)}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98]"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
            Sign in with Email
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              &rarr;
            </motion.span>
          </button>
        </motion.div>
      </div>

      <EmailLoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Index;
