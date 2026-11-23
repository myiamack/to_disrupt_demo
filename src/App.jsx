import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';

// The single-file preview opens from disk, so it needs hash-based links.
const Router = import.meta.env.VITE_PREVIEW === '1' ? HashRouter : BrowserRouter;
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import Game from '@/pages/Game';
import Admin from '@/pages/Admin';
import MotionBackground from '@/fun/MotionBackground';

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <MotionBackground />
      <Router basename={import.meta.env.VITE_PREVIEW === '1' ? undefined : import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Game />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
