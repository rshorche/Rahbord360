// src/store/transactions/transactions.js

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useTransactionStore = create(
  persist(
    (set, get) => ({
      // 'get' را برای دسترسی به حالت فعلی (transactions) اضافه کنید
      transactions: [],

      addTransaction: (newTransaction) => {
        const transactionWithId = {
          ...newTransaction,
          id: crypto.randomUUID(),
        };

        set((state) => ({
          transactions: [...state.transactions, transactionWithId], // منطق مرتب‌سازی (sort) از اینجا حذف شد
        }));
      },

      updateTransaction: (id, updatedData) => {
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id
              ? { ...transaction, ...updatedData, id: transaction.id }
              : transaction
          ),
          // منطق مرتب‌سازی (sort) از اینجا حذف شد
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter(
            (transaction) => transaction.id !== id
          ),
        }));
      },

      // تابع جدید برای دریافت تراکنش‌های مرتب‌شده و محاسبه مجموع‌ها (getTotals)
      getTotals: () => {
        let deposit = 0;
        let withdraw = 0;
        get().transactions.forEach((t) => {
          // از get() برای دسترسی به transactions استفاده کنید
          if (t.type === "deposit") {
            deposit += t.amount;
          } else {
            withdraw += t.amount;
          }
        });
        return {
          totalDeposit: deposit,
          totalWithdraw: withdraw,
          netValue: deposit - withdraw,
        };
      },

      getSortedTransactions: () => {
        return [...get().transactions].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
      },
    }),
    {
      name: "rahbord360-transactions-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useTransactionStore;
