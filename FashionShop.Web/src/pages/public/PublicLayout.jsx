import { Outlet } from 'react-router-dom';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';

export default function PublicLayout() {
    return (
        <div className="pub-layout">
            <PublicHeader />
            <main className="pub-main">
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
}
