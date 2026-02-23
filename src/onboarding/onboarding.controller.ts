import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import {
  SetGoalsDto,
  SubmitPlacementTestDto,
} from './dto/onboarding.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('placement-test/submit')
  submitPlacementTest(@Body() dto: SubmitPlacementTestDto) {
    return this.onboardingService.submitPlacementTest(dto.answers);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('goals')
  setGoals(@CurrentUser() user: User, @Body() dto: SetGoalsDto) {
    return this.onboardingService.setGoals(user.id, dto);
  }
}
