const { Route, Routes } = ReactRouterDOM
const Router = ReactRouterDOM.HashRouter

import { AppHeader } from './cmps/AppHeader.jsx'
import { UserMsg } from './cmps/UserMsg.jsx'
import { About } from './pages/About.jsx'
import { Home } from './pages/Home.jsx'
import { MailIndex } from './apps/mail/pages/MailIndex.jsx'
import { MailDetails } from './apps/mail/pages/MailDetails.jsx'
import { MailCompose } from './apps/mail/pages/MailCompose.jsx'
import { NoteIndex } from './apps/note/pages/NoteIndex.jsx'

export function RootCmp() {
    return <Router>
        <section className="root-cmp">
            <AppHeader />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />

                {/* mail - omer. compose is nested so MailIndex stays mounted
                    behind the overlay, through its <Outlet /> */}
                <Route path="/mail" element={<MailIndex />}>
                    <Route path="compose" element={<MailCompose />} />
                    <Route path="compose/:mailId" element={<MailCompose />} />
                </Route>
                <Route path="/mail/:mailId" element={<MailDetails />} />

                {/* note - maor */}
                <Route path="/note" element={<NoteIndex />} />
            </Routes>
            <UserMsg />
        </section>
    </Router>
}
