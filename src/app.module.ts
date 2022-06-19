import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PokerModule } from './poker/poker.module';
import { FrontendMiddleware } from './middleware/frontend.middleware';
@Module({
  imports: [PokerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // constructor(private readonly connection: Connection) { }

  // configure(consumer: MiddlewareConsumer): void {
  //   consumer.apply(FrontendMiddleware).forRoutes(
  //     {
  //       path: '/**', // For all routes
  //       method: RequestMethod.GET, // For all methods
  //     },
  //     {
  //       path: '/**', // For all routes
  //       method: RequestMethod.POST, // For all methods
  //     },
  //     {
  //       path: '/**', // For all routes
  //       method: RequestMethod.PATCH, // For all methods
  //     },
  //     {
  //       path: '/**', // For all routes
  //       method: RequestMethod.OPTIONS, // For all methods
  //     },
  //     {
  //       path: '/**', // For all routes
  //       method: RequestMethod.PUT, // For all methods
  //     },
  //   );
  // }
}
