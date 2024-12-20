import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import * as XLSX from 'xlsx';
@Injectable()
export class ExcelService {
  async readFile(file: any): Promise<any[]> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    } catch {
      throw new HttpException('Lỗi khi đọc file Excel', HttpStatus.BAD_REQUEST);
    }
  }
  async parseToExam(file: any): Promise<any> {
    const jsonData = await this.readFile(file);

    const exam = {
      title: '',
      duration: 0,
      category: '',
      sections: [],
      sectionCount: 0,
      questionCount: 0,
    };

    // Đọc thông tin tiêu đề, thời gian thi, và loại bài thi
    exam.title = jsonData[0][1]; // Tiêu đề
    exam.duration = Number(jsonData[1][1]); // Thời gian thi
    exam.category = jsonData[2][1]; // Loại bài thi

    if (!exam.title) {
      throw new HttpException(
        'Tiêu đề không được để trống.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (isNaN(exam.duration) || exam.duration <= 0) {
      throw new HttpException(
        'Thời gian thi phải là một số dương.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!exam.category) {
      throw new HttpException(
        'Loại bài thi không được để trống.',
        HttpStatus.BAD_REQUEST,
      );
    }

    let currentSection = null;
    let i = 6; // Khởi tạo biến đếm cho hàng bắt đầu từ hàng thứ 6

    // Vòng lặp while để kiểm tra hàng rỗng và lặp qua dữ liệu
    while (jsonData[i].length !== 0) {
      const row = jsonData[i];

      // Kiểm tra nếu hàng là tiêu đề phần thi
      if (row[0]) {
        if (currentSection) {
          if (!currentSection.name) {
            throw new HttpException(
              'Phần thi phải có tên',
              HttpStatus.BAD_REQUEST,
            );
          }
          if (currentSection.questions.length === 0) {
            throw new HttpException(
              'Phần thi có ít nhất 1 câu hỏi',
              HttpStatus.BAD_REQUEST,
            );
          }

          // Cập nhật số phần thi và câu hỏi
          exam.sectionCount++;
          exam.questionCount += currentSection.questions.length;
          exam.sections.push(currentSection); // Thêm phần thi trước đó vào danh sách
        }

        // Khởi tạo phần thi mới
        currentSection = {
          name: row[0],
          tags: [], // Bạn có thể thêm logic để điền tags nếu cần
          questions: [],
          questionCount: 0,
        };
      }

      if (row[1]) {
        currentSection.tags.push(row[1]);
      }

      if (currentSection) {
        // Nếu hàng không phải tiêu đề phần thi, kiểm tra và thêm câu hỏi
        const question = {
          serial: row[2],
          content: row[3], // Câu hỏi
          image: row[4],
          options: [
            row[5] ?? '', // Nếu row[4] là null hoặc undefined, sử dụng ""
            row[6] ?? '', // Tương tự cho row[5]
            row[7] ?? '', // Tương tự cho row[6]
            row[8] ?? '', // Tương tự cho row[7]
          ],
          correctAnswer: row[9], // Đáp án đúng
          tag: row[10], // Gán tag đầu tiên cho câu hỏi
        };

        if (!question.serial) {
          throw new HttpException(
            'Số thứ tự không được để trống.',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (!question.content) {
          throw new HttpException(
            'Câu hỏi không được để trống.',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (!question.correctAnswer) {
          throw new HttpException(
            'Đáp án đúng không được để trống.',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (!question.tag && currentSection.tags.length > 0) {
          throw new HttpException(
            'Nếu phần thi có nhiều tag thì câu hỏi phải thuộc về 1 tag',
            HttpStatus.BAD_REQUEST,
          );
        }
        currentSection.questionCount++;
        currentSection.questions.push(question);
      }

      i++; // Tăng biến đếm để tiếp tục vòng lặp
    }

    // Thêm phần thi cuối cùng nếu có
    if (currentSection) {
      exam.sectionCount++;
      exam.questionCount += currentSection.questions.length;
      exam.sections.push(currentSection);
    }

    // Kiểm tra xem bài thi có phần thi nào không
    if (exam.sections.length === 0) {
      throw new HttpException(
        'Phải có ít nhất 1 phần thi',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Trả về kết quả cùng với số liệu đếm
    return exam;
  }
}
