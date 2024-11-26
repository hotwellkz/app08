import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Users, Building2, Mail, Phone } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, getDocs, where } from 'firebase/firestore';
import { db, addCategory, deleteCategory } from '../lib/firebase';
import { Employee } from '../types/employee';
import { EmployeeModal } from '../components/employees/EmployeeModal';
import { TransactionHistory } from '../components/transactions/TransactionHistory';
import { CategoryCardType } from '../types';

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryCardType | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'employees'), orderBy('lastName'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const employeesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Employee[];
      
      setEmployees(employeesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (employee: Employee) => {
    if (window.confirm(`Вы уверены, что хотите удалить сотрудника ${employee.lastName} ${employee.firstName}?`)) {
      try {
        // Удаляем сотрудника из коллекции employees
        await deleteDoc(doc(db, 'employees', employee.id));

        // Находим и удаляем соответствующую категорию
        const q = query(
          collection(db, 'categories'),
          where('title', '==', `${employee.lastName} ${employee.firstName}`),
          where('row', '==', 2)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const categoryDoc = snapshot.docs[0];
          await deleteCategory(categoryDoc.id, `${employee.lastName} ${employee.firstName}`, false);
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Ошибка при удалении сотрудника');
      }
    }
  };

  const handleViewHistory = async (employee: Employee) => {
    try {
      const q = query(
        collection(db, 'categories'),
        where('title', '==', `${employee.lastName} ${employee.firstName}`),
        where('row', '==', 2)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const categoryDoc = snapshot.docs[0];
        setSelectedCategory({
          id: categoryDoc.id,
          title: categoryDoc.data().title,
          amount: categoryDoc.data().amount,
          iconName: categoryDoc.data().icon,
          color: categoryDoc.data().color,
          row: 2
        });
        setShowHistory(true);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      alert('Ошибка при получении истории транзакций');
    }
  };

  const formatDate = (createdAt: any) => {
    if (!createdAt || !createdAt.seconds) {
      return 'Дата не указана';
    }
    return new Date(createdAt.seconds * 1000).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button onClick={() => window.history.back()} className="mr-4">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Сотрудники</h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-1" />
              Добавить сотрудника
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Нет сотрудников</h3>
            <p className="text-gray-500">Добавьте первого сотрудника</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {employee.lastName} {employee.firstName}
                        </h3>
                        <p className="text-sm text-gray-500">{employee.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.salary.toLocaleString()} ₸
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(employee.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="w-4 h-4 mr-2" />
                      {employee.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="w-4 h-4 mr-2" />
                      {employee.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Building2 className="w-4 h-4 mr-2" />
                      {employee.position}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => handleViewHistory(employee)}
                      className="px-3 py-1 text-sm text-amber-600 hover:text-amber-700"
                    >
                      История транзакций
                    </button>
                    <button
                      onClick={() => handleDelete(employee)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={() => {
          setShowAddModal(false);
        }}
      />

      {showHistory && selectedCategory && (
        <TransactionHistory
          category={selectedCategory}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};