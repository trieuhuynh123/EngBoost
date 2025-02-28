"use client";
import Loading from "@/components/loading";
import NotFound from "@/components/not-found";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { VocabularyContainer } from "@/components/vocabulary/vocabulary-container";
import { openModal } from "@/lib/store/modal-slice";
import { Flashcard } from "@/types";
import axios from "axios";
import { Edit3 } from "lucide-react";

import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import React, { useEffect, useState } from "react";
import { TbDotsVertical, TbPlus } from "react-icons/tb";
import { useDispatch } from "react-redux";

const FlashcardIdPage = () => {
  const [flashcard, setFlashcard] = useState<Flashcard>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { flashcardId } = useParams();

  useEffect(() => {
    const fetchFlashcard = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/flashcards/${flashcardId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response);
        setFlashcard(response.data);
      } catch (error: any) {
        console.log(error);
        if (error.response.status === 401) {
          router.replace(`/login?next=${pathname}?${searchParams}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (flashcardId) {
      fetchFlashcard();
    }
  }, []);
  if (isLoading) {
    return <Loading />;
  }
  if (!flashcard) {
    return <NotFound />;
  }
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <main className="container mx-auto px-8 py-4 bg-white shadow-sm rounded-2xl border border-slate-400">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">
            {flashcard.title}
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="secondary" className="rounded-full bg-slate-100 size-8 p-0">
                <TbDotsVertical className="icon-sm text-slate-800 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="mt-2 mr-4 text-sm bg-white border border-slate-400 min-w-[150px] dark:bg-background-alt"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuItem
                onClick={() =>
                  dispatch(
                    openModal({
                      type: "UpdateFlashcard",
                      data: { flashcard },
                    })
                  )
                }
              >
                <div className="flex items-center space-x-2">
                  <Edit3 className="size-3.5 text-muted-foreground" />
                  <span>Edit Flashcard</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  dispatch(
                    openModal({
                      type: "CreateVocabulary",
                      data: { vocabulary: { flashcard } },
                      isReload: true,
                    })
                  )
                }
              >
                <div className="flex items-center space-x-2">
                  <TbPlus className="size-3.5 text-muted-foreground" />
                  <span>Add Vocabulary</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {flashcard.description && (
          <div className="mb-6">
            <Textarea
              className="w-full border border-slate-300 rounded-md p-3 text-slate-800 bg-slate-100 focus:ring-sky-500"
              defaultValue={flashcard.description}
              readOnly
            />
          </div>
        )}

        {/* Vocabulary Count */}
        <div className="mb-6 text-slate-800">
          <strong>Vocabulary Count:</strong> {flashcard.vocabularyCount}
        </div>

        {/* Vocabulary List */}
        <div>
          <VocabularyContainer owner={flashcard.owner} />
        </div>
      </main>
    </div>
  );
};

export default FlashcardIdPage;
