import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ApprovedContent } from '../entities/approved_content.entity';
import { PendingContent } from '../entities/pending-content.entity';

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any;

  constructor(
    @InjectRepository(ApprovedContent)
    private approvedContentRepository: Repository<ApprovedContent>,
    @InjectRepository(PendingContent)
    private pendingContentRepository: Repository<PendingContent>
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  private async classifyUserIntent(userPrompt: string): Promise<'HEALTH' | 'GENERAL'> {
    const classificationPrompt = `
        Phân loại câu hỏi của người dùng thành một trong hai loại sau: HEALTH hoặc GENERAL.
        - HEALTH: Các câu hỏi liên quan trực tiếp đến bệnh tật, triệu chứng, thuốc men, phương pháp điều trị, sức khỏe.
        - GENERAL: Các câu hỏi thông thường, chào hỏi, hoặc các chủ đề không liên quan đến y tế.

        Chỉ trả về một từ duy nhất: HEALTH hoặc GENERAL.

        Ví dụ:
        Câu hỏi: "Tôi bị đau đầu và sốt thì phải làm sao?"
        Phân loại: HEALTH

        Câu hỏi: "Bệnh viện Chợ Rẫy ở đâu?"
        Phân loại: GENERAL

        Câu hỏi: "Chào bạn"
        Phân loại: GENERAL

        Câu hỏi: "Triệu chứng của bệnh tiểu đường là gì?"
        Phân loại: HEALTH
        
        ---
        Bây giờ, hãy phân loại câu hỏi sau:
        Câu hỏi: "${userPrompt}"
        Phân loại:
      `;

    try {
      const result = await this.model.generateContent(classificationPrompt);
      const response = await result.response;
      const classification = response.text().trim().toUpperCase();

      if (classification === 'HEALTH') {
        return 'HEALTH';
      }
      return 'GENERAL';
    } catch (error) {
      console.error('Error during intent classification:', error);
      return 'GENERAL';
    }
  }

  private async generateGeneralResponse(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating general response with Gemini:', error);
      return 'Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại sau.';
    }
  }

  async handleUserPrompt(prompt: string): Promise<string> {
    // Phân loại ý định
    const intent = await this.classifyUserIntent(prompt);

    if (intent === 'HEALTH') {
      console.log('Intent classified as: HEALTH. Executing advanced search...');

      const healthPromt = `
          Luôn dịch câu trả lời sang tiếng việt
          Hãy phân tách các keyword liên quan đến sức khỏe có trong promt sau và chỉ trả về keyword và tách các keyword khác nhau bằng dấu ','
          Ví dụ:
          Promt: tôi cảm thấy bị đau đầu
          Output: đau đầu,

          Promt: nếu tôi cảm thấy đau đầu thì tôi nên đến đâu để khám
          Output: đau đầu,
          
          Promt: tôi cảm thấy bị đau đầu, choáng váng, buồn nôn thì tôi đang bị bệnh gì
          Output: đau đầu, choáng váng, buồn nôn
          
          ---
          Bây giờ, hãy phân tách keyword trong câu hỏi sau:
          Câu hỏi: "${prompt}"
          Output:
      `;

      try {
        const result = await this.model.generateContent(healthPromt);
        const response = await result.response;
        const keywords = response.text().trim().toUpperCase();

        // Chuẩn hóa và trích xuất từ khóa chính từ câu hỏi người dùng
        const userKeywords = keywords
          .toLowerCase()
          .split(',')
          .filter((kw) => kw.length > 0);

        console.log('Filtered User Keywords:', userKeywords);

        // Nếu không có từ khóa nào sau khi lọc, không cần tìm kiếm
        if (userKeywords.length === 0) {
          return this.getSafeResponseAndSave(prompt, []);
        }

        const whereConditions = userKeywords.map((kw) => ({ keyword: Like(`%${kw}%`) }));

        const potentialMatches = await this.approvedContentRepository.find({
          where: whereConditions,
          take: 20 // Giới hạn kết quả để tối ưu hiệu năng
        });

        if (potentialMatches.length === 0) {
          return this.getSafeResponseAndSave(prompt, userKeywords);
        }

        // Tính điểm độ liên quan
        let bestMatch = null;
        let maxRelevance = 0;
        const MINIMUM_RELEVANCE_THRESHOLD = 0.5; // 50% từ khóa khớp

        for (const match of potentialMatches) {
          const dbKeywords = match.keyword
            .toLowerCase()
            .split(',')
            .map((kw) => kw.trim());

          let matchedCount = 0;

          for (const userKw of userKeywords) {
            const isMatch = dbKeywords.some((dbKw) => dbKw.includes(userKw) || userKw.includes(dbKw));
            if (isMatch) {
              matchedCount++;
            }
          }

          // Tính điểm: Số từ khớp / Tổng số từ khóa user hỏi
          const relevance = matchedCount / userKeywords.length;

          console.log(`Checking DB ID ${match.id}: Score ${relevance} (Matched ${matchedCount}/${userKeywords.length})`);

          if (relevance > maxRelevance) {
            maxRelevance = relevance;
            bestMatch = match;
          }
        }

        // Trả kết quả
        if (bestMatch && maxRelevance >= MINIMUM_RELEVANCE_THRESHOLD) {
          console.log(`> Best match selected: "${bestMatch.keyword}" with score: ${maxRelevance}`);
          return bestMatch.response_template;
        } else {
          console.log('> No sufficient match found.');
          return this.getSafeResponseAndSave(prompt, userKeywords);
        }
      } catch (error) {
        console.error('Error processing health prompt:', error);
        return 'Rất tiếc, hệ thống đang bận. Vui lòng thử lại sau.';
      }
    } else {
      // Logic dành cho câu hỏi thông thường
      console.log('Intent classified as: GENERAL');
      return this.generateGeneralResponse(prompt);
    }
  }

  // Lưu câu hỏi và phản hồi an toàn vào PendingContent
  private async getSafeResponseAndSave(prompt: string, keywords: string[]): Promise<string> {
    const fixedResponse =
      'Rất xin lỗi, tôi không thể trả lời vấn đề này của bạn vì tôi không có thông tin chính xác. Bạn hãy đến bệnh viện gần nhất để được gặp bác sĩ chuyên khoa và nhận tư vấn chính xác nhé.';

    const newPendingItem = this.pendingContentRepository.create({
      user_question: prompt,
      ai_response: fixedResponse,
      detected_keyword: keywords.join(', '),
      status: 'pending'
    });
    await this.pendingContentRepository.save(newPendingItem);

    return fixedResponse;
  }
}
