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
import { BookIndex } from './apps/book/pages/BookIndex.jsx'
import { BookDetails } from './apps/book/pages/BookDetails.jsx'
import { BookEdit } from './apps/book/pages/BookEdit.jsx'
import { AddGoogleBook } from './apps/book/pages/AddGoogleBook.jsx'

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
                <Route path="/book" element={<BookIndex />} />
                <Route path="/book/edit" element={<BookEdit />} />
                <Route path="/book/edit/:bookId" element={<BookEdit />} />
                <Route path="/book/:bookId" element={<BookDetails />} />
                <Route path="/add-book" element={<AddGoogleBook />} />
            </Routes>
            <UserMsg />
        </section>
    </Router>
}
