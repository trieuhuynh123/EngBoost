import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExamModule } from './exam/exam.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ExcelService } from './excel/excel.service';
import { UserExamModule } from './user-exam/user-exam.module';
import { CommentModule } from './comment/comment.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { FlashcardModule } from './flashcard/flashcard.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UserexamdraftModule } from './userexamdraft/userexamdraft.module';
import jwtConfig from './config/jwt.config';
import { MessageModule } from './message/message.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { ChatModule } from './chat/ chat.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),

    MongooseModule.forRoot(process.env.DATABASE_URL),
    ExamModule,
    UserExamModule,
    CommentModule,
    AuthModule,
    FlashcardModule,
    VocabularyModule,
    CloudinaryModule,
    UserexamdraftModule,
    MessageModule,
    RecommendationModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService, ExcelService],
})
export class AppModule {}
