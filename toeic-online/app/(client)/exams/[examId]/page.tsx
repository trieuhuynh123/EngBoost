// pages/exams/[examId].tsx
"use client";
import { ExamSectionInfo } from "@/components/exam/exam-section-info";
import { UserExamContainer } from "@/components/user-exam/user-exam-container";
import { Exam } from "@/types"; // Assume you have defined the Exam type here
import axios from "axios";
import { TfiTimer } from "react-icons/tfi";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { AiOutlineComment } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { GiSpellBook } from "react-icons/gi";
import { FaUserAstronaut } from "react-icons/fa6";
import { TbMessageCircleQuestion } from "react-icons/tb";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Assume you have a Select component
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";
import { CommentContainer } from "@/components/comment/comment-container";
import Loading from "@/components/loading";
import NotFound from "@/components/not-found";
const ExamIdPage = () => {
  const params = useParams();
  const isLogin = useSelector((state: RootState) => state.data.isLogin);
  const [exam, setExam] = useState<Exam | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isEntireExamSelected, setIsEntireExamSelected] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/exams/${params.examId}`
        );
        setExam(response.data);
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    if (params.examId) {
      fetchExam();
    }
  }, [params.examId]);

  const handleSelectSection = (id: string) => {
    if (selectedSections.includes(id)) {
      setSelectedSections(
        selectedSections.filter((sectionId) => sectionId !== id)
      );
    } else {
      setSelectedSections([...selectedSections, id]);
    }
  };

  const handleSelectEntireExam = () => {
    if (isEntireExamSelected) {
      setIsEntireExamSelected(false);
      setSelectedSections([]);
    } else {
      setIsEntireExamSelected(true);
      if (exam) {
        const allSectionIds = exam.sections.map((section) => section._id);
        setSelectedSections(allSectionIds);
      }
    }
  };

  if (isLoading) {
    return <Loading />;
  }
  if (!exam) {
    return <NotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* White Frame Container */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Exam Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              #{exam.category}
            </span>
          </div>
          <h1 className="text-3xl text-center font-bold text-gray-800 mb-4">
            {exam.title}
          </h1>
        </div>
        <Tabs defaultValue="1">
          <div className="flex justify-center mb-6">
            <TabsList className="flex space-x-2 rounded-lg bg-gray-100 p-1">
              <TabsTrigger
                value="1"
                className="px-4 py-2 font-medium text-gray-700 hover:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 data-[state=active]:bg-gray-200 data-[state=active]:text-gray-900 data-[state=active]:font-bold"
              >
                Thông tin đề thi
              </TabsTrigger>
              {isLogin && (
                <TabsTrigger
                  value="2"
                  className="px-4 py-2 font-medium text-gray-700 hover:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 data-[state=active]:bg-gray-200 data-[state=active]:text-gray-900 data-[state=active]:font-bold"
                >
                  Đáp án Transcript
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="1">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 border border-gray-100 rounded-md shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-2">
                  Chi tiết đề thi
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <TfiTimer className="mr-3 text-blue-600 w-5 h-5" />
                    <span>Thời gian làm bài: {exam.duration} phút</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <GiSpellBook className="mr-3 text-blue-600 w-5 h-5" />
                    <span>Phần thi: {exam.sectionCount} phần</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <TbMessageCircleQuestion className="mr-3 text-blue-600 w-5 h-5" />
                    <span>Câu hỏi: {exam.questionCount} câu</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <AiOutlineComment className="mr-3 text-blue-600 w-5 h-5" />
                    <span>Bình luận: {exam.commentCount} bình luận</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <FaUserAstronaut className="mr-3 text-blue-600 w-5 h-5" />
                    <span>Người luyện: {exam.userCount} người</span>
                  </li>
                </ul>
              </div>
              {/* User Exam Container */}
              {isLogin && (
                <div className="mb-6">
                  <UserExamContainer examId={params.examId as string} />
                </div>
              )}
              {/* Exam Sections */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                  Các Phần Thi
                </h2>
                {/* Selection Controls */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={isEntireExamSelected}
                    onChange={handleSelectEntireExam}
                    className="mr-2"
                  />
                  <label className="text-lg text-gray-700">
                    Chọn toàn bộ đề thi
                  </label>
                </div>
                <div className="flex flex-col space-y-4">
                  {exam.sections.map((section) => (
                    <ExamSectionInfo
                      id={section._id}
                      name={section.name}
                      questionCount={section.questionCount}
                      tags={section.tags}
                      key={section._id}
                      isSelected={selectedSections.includes(section._id)}
                      onSelect={handleSelectSection}
                      disabled={isEntireExamSelected}
                    />
                  ))}
                </div>
              </div>
              {/* Time Selection Dropdown */}
              {/* Time Selection Dropdown */}
              <div className="mb-6">
                <label
                  htmlFor="time-select"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  Chọn thời gian luyện tập:
                </label>
                <Select
                  onValueChange={(value) => {
                    setSelectedTime(value);
                  }}
                  defaultValue="0"
                >
                  {/* Assign 'id' to SelectTrigger */}
                  <SelectTrigger id="time-select" className="w-full">
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Không giới hạn</SelectItem>
                    <SelectItem value="10">5 phút</SelectItem>
                    <SelectItem value="600">10 phút</SelectItem>
                    <SelectItem value="900">15 phút</SelectItem>
                    <SelectItem value="1200">20 phút</SelectItem>
                    <SelectItem value="1500">25 phút</SelectItem>
                    <SelectItem value="1800">30 phút</SelectItem>
                    <SelectItem value="2100">35 phút</SelectItem>
                    <SelectItem value="2400">40 phút</SelectItem>
                    <SelectItem value="2700">45 phút</SelectItem>
                    <SelectItem value="3000">50 phút</SelectItem>
                    <SelectItem value="3300">55 phút</SelectItem>
                    <SelectItem value="3600">60 phút</SelectItem>
                    <SelectItem value="3900">65 phút</SelectItem>
                    <SelectItem value="4200">70 phút</SelectItem>
                    <SelectItem value="4500">75 phút</SelectItem>
                    <SelectItem value="4800">80 phút</SelectItem>
                    <SelectItem value="5100">85 phút</SelectItem>
                    <SelectItem value="5400">90 phút</SelectItem>
                    <SelectItem value="5700">95 phút</SelectItem>
                    <SelectItem value="6000">100 phút</SelectItem>
                    <SelectItem value="6300">105 phút</SelectItem>
                    <SelectItem value="6600">110 phút</SelectItem>
                    <SelectItem value="6900">115 phút</SelectItem>
                    <SelectItem value="7200">120 phút</SelectItem>
                    <SelectItem value="7500">125 phút</SelectItem>
                    <SelectItem value="7800">130 phút</SelectItem>
                    <SelectItem value="8100">135 phút</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Submit Button */}
              <div className="flex justify-center items-center mb-6">
                <Button
                  className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
                  disabled={
                    !isEntireExamSelected && selectedSections.length === 0
                  }
                >
                  <Link
                    href={{
                      pathname: `/exams/${params.examId}/practice`,
                      query: {
                        time: selectedTime,
                        sectionId: selectedSections,
                      },
                    }}
                  >
                    Bắt đầu luyện tập
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="2">
            <div className="space-y-4">
              {/* Solutions Overview */}
              <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                <Button
                  variant="link"
                  className="text-blue-600 hover:underline"
                >
                  <Link href={`/exams/${params.examId}/solutions`}>
                    Xem đáp án đề thi
                  </Link>
                </Button>
              </div>
              {/* Detailed Solutions */}
              <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Đáp án Các Phần Thi
                </h2>
                <ul className="space-y-2">
                  {exam.sections.map((section) => (
                    <li
                      key={section._id}
                      className="flex items-center justify-between p-3 border rounded-md bg-white hover:shadow-sm"
                    >
                      <div className="text-gray-700">
                        <span className="font-medium">{section.name}</span>
                      </div>
                      <Button
                        variant="link"
                        className="text-blue-600 hover:underline text-sm font-semibold"
                      >
                        <Link
                          href={`/exams/${params.examId}/parts/${section._id}/solutions`}
                        >
                          Đáp án
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <CommentContainer />
    </div>
  );
};

export default ExamIdPage;