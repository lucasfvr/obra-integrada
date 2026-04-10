import { BrowserRouter as Router, Routes, Route } from "react-router";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Users from "./pages/Users";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/users" element={<Users />} />
          </Route>
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </>
  );
}
