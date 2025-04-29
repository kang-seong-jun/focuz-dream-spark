
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";
import { SleepProvider } from "@/context/SleepContext";
import { GameProvider } from "@/context/GameContext";

import Welcome from "./pages/Welcome";
import Intro from "./pages/Intro";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BaselineSleepQuestions from "./pages/onboarding/BaselineSleepQuestions";
import CognitiveBaseline from "./pages/onboarding/CognitiveBaseline";
import Dashboard from "./pages/Dashboard";
import Daily from "./pages/Daily";
import History from "./pages/History";
import Insights from "./pages/Insights";
import More from "./pages/More";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SleepProvider>
        <GameProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/intro" element={<Intro />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/onboarding/sleep/:questionNumber" element={<BaselineSleepQuestions />} />
                <Route path="/onboarding/cognitive" element={<CognitiveBaseline />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/daily" element={<Daily />} />
                <Route path="/history" element={<History />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/more" element={<More />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </GameProvider>
      </SleepProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
