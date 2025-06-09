import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useTransactionStore = create(
  persist(
    (set) => ({
      transactions: [],

      addTransaction: (newTransaction) => {
        const transactionWithId = {
          ...newTransaction,
          id: crypto.randomUUID(),
        };

        set((state) => ({
          transactions: [...state.transactions, transactionWithId].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          ),
        }));
      },

      updateTransaction: (id, updatedData) => {
        set((state) => ({
          transactions: state.transactions
            .map((transaction) =>
              transaction.id === id
                ? { ...transaction, ...updatedData, id: transaction.id }
                : transaction
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date)),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter(
            (transaction) => transaction.id !== id
          ),
        }));
      },
    }),
    {
      name: "rahbord360-transactions-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useTransactionStore;
