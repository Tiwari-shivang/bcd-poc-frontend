import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Providers } from '@/app/providers'
import OipLayout from '@/layouts/oip-layout'
import ContractAgentPage from '@/routes/contract-agent-page'
import OipHome from '@/routes/oip-home'
import PlaceholderPage from '@/routes/placeholder-page'

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route element={<OipLayout />}>
            <Route index element={<OipHome />} />
            <Route path="/contract-agent" element={<ContractAgentPage />} />
            <Route
              path="/recently"
              element={<PlaceholderPage title="Recently" />}
            />
            <Route
              path="/bookmarks"
              element={<PlaceholderPage title="Bookmarks" />}
            />
            <Route
              path="/news-library"
              element={<PlaceholderPage title="News and library" />}
            />
            <Route
              path="/contact-us"
              element={<PlaceholderPage title="Contact us" />}
            />
            <Route path="*" element={<PlaceholderPage title="Not found" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Providers>
  )
}
