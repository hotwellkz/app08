import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Feed } from './pages/Feed';
import { DailyReport } from './pages/DailyReport';
import { Clients } from './pages/Clients';
import { ContractTemplates } from './pages/ContractTemplates';
import { Products } from './pages/Products';
import { Transactions } from './pages/Transactions';
import { Employees } from './pages/Employees';
import { useStats } from './hooks/useStats';
import { LoadingSpinner } from './components/LoadingSpinner';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase';

type Page = 'transactions' | 'feed' | 'daily-report' | 'clients' | 'templates' | 'products' | 'employees';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('transactions');
  const { stats, loading: statsLoading, error: statsError } = useStats();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'));
        console.log('Firebase connected, documents count:', snapshot.size);
        setIsLoading(false);
      } catch (error) {
        console.error('Firebase initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading || statsLoading) {
    return <LoadingSpinner />;
  }

  if (statsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-xl text-red-500 p-4 bg-white rounded-lg shadow">
          Ошибка загрузки данных: {statsError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onPageChange={setCurrentPage} currentPage={currentPage} />
      <div className="lg:pl-64">
        <Header stats={stats} />
        {currentPage === 'transactions' && <Transactions />}
        {currentPage === 'feed' && <Feed />}
        {currentPage === 'daily-report' && <DailyReport />}
        {currentPage === 'clients' && <Clients />}
        {currentPage === 'templates' && <ContractTemplates />}
        {currentPage === 'products' && <Products />}
        {currentPage === 'employees' && <Employees />}
      </div>
    </div>
  );
};

export default App;