import { redirect } from 'next/navigation';

export default function Home() {
    redirect('/Customer-shop/Register');
    return null;
}
