"use client";
import { FlashcardItem } from "@/components/flashcard/flashcard-item";
import { PaginationCustom } from "@/components/pagination-custom";
import { openModal } from "@/lib/store/modal-slice";
import { Flashcard } from "@/types";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import { TbPlus } from "react-icons/tb";
import { useDispatch } from "react-redux";

// Separate component that uses useSearchParams
const FlashcardContent = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>();
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const page = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchFlashcard = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/flashcards/search`,
          {
            params: {
              currentPage: page,
              pageSize: 20,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        setFlashcards(response.data.data);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.response.status === 401) {
          router.replace(`/login?next=${pathname}?${searchParams}`);
        }
      }
    };
    fetchFlashcard();
  }, [page, router, pathname, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <main className="container mx-auto px-6 py-4 bg-white shadow-sm rounded-2xl border border-slate-400">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Exam</h1>
        </div>
        {flashcards && flashcards.length > 0 ? (
          <>
            <div className="grid gap-5 justify-center grid-cols-[repeat(auto-fit,minmax(230px,1fr))]">
              {/* "Create Flashcard" card */}
              <div
                onClick={() =>
                  dispatch(
                    openModal({
                      type: "CreateFlashcard",
                    })
                  )
                }
                className="flex flex-col justify-between w-[230px] h-[190px] bg-slate-50 rounded-lg 
  p-4 border-2 border-dashed border-slate-400 hover:border-slate-400 transition-transform 
  transform hover:scale-105 hover:shadow-sm duration-200 ease-in-out cursor-pointer"
>
                {/* Icon + Title */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 border-2 border-dashed border-gray-300 rounded-lg">
                    <TbPlus className="text-gray-500" size={20} />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-700">
                    Create Flashcard
                  </h2>
                </div>

                {/* Description */}
                <p className="mt-2 text-xs text-gray-500">
                  Prepare your own flashcards for better vocabulary management.
                </p>

                {/* Horizontal rule + Link-like text */}
                <hr className="my-2 border-gray-200" />
                <div className="text-xs text-gray-500 hover:underline">
                  → Import Flashcard
                </div>
              </div>

              {/* Existing flashcards */}
              {flashcards.map((flashcard) => (
                <FlashcardItem key={flashcard._id} {...flashcard} />
              ))}
            </div>
            <div className="mt-6">
              <PaginationCustom
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 text-lg">
            No flashcards available.
          </div>
        )}
      </main>
    </div>
  );
};

// Loading component for Suspense fallback
const FlashcardLoading = () => (
  <div className="min-h-screen bg-slate-50 py-8">
    <main className="container mx-auto px-6 py-4 bg-white shadow-sm rounded-2xl border border-slate-400">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Exam</h1>
      </div>
      <div className="text-center text-gray-500 text-lg">
        Loading flashcards...
      </div>
    </main>
  </div>
);

// Main component with Suspense boundary
const FlashcardPage = () => {
  return (
    <Suspense fallback={<FlashcardLoading />}>
      <FlashcardContent />
    </Suspense>
  );
};

export default FlashcardPage;