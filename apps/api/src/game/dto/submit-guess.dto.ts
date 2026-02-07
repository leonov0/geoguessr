import { IsInt, Min, Max } from 'class-validator';

export class SubmitGuessDto {
  @IsInt()
  @Min(0)
  @Max(2048)
  x: number;

  @IsInt()
  @Min(0)
  @Max(1024)
  y: number;
}
