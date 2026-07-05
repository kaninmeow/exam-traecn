import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import PdfManage from '@/pages/PdfManage';
import PdfViewer from '@/pages/PdfViewer';
import AiSummary from '@/pages/AiSummary';
import GenerateQuestions from '@/pages/GenerateQuestions';
import Practice from '@/pages/Practice';
import WrongBook from '@/pages/WrongBook';
import Favorites from '@/pages/Favorites';
import AiChat from '@/pages/AiChat';
import Statistics from '@/pages/Statistics';
import Settings from '@/pages/Settings';
import { useSettingsStore } from '@/stores/settingsStore';
import { useEffect } from 'react';

export default function App() {
  const { settings } = useSettingsStore();

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pdf" element={<PdfManage />} />
          <Route path="/pdf/:id" element={<PdfViewer />} />
          <Route path="/pdf/:id/summary" element={<AiSummary />} />
          <Route path="/pdf/:id/generate" element={<GenerateQuestions />} />
          <Route path="/practice/:pdfId" element={<Practice />} />
          <Route path="/practice/:pdfId/:mode" element={<Practice />} />
          <Route path="/wrong-book" element={<WrongBook />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/chat/:pdfId" element={<AiChat />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
