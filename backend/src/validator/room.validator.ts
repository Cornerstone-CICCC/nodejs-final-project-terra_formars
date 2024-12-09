import { ValidationError } from "../utils/errors";

export const validateRoomSettings = ({
  maxPlayers,
  numberOfPrompts,
  timeLimit,
}: {
  maxPlayers: number;
  numberOfPrompts: number;
  timeLimit: number;
}) => {
  if (maxPlayers < 2 || maxPlayers > 8) {
    throw new ValidationError("Max players must be between 2 and 8");
  }

  if (numberOfPrompts < 1 || numberOfPrompts > 10) {
    throw new ValidationError("Number of prompts must be between 1 and 10");
  }

  if (timeLimit < 30 || timeLimit > 300) {
    throw new ValidationError("Time limit must be between 30 and 300 seconds");
  }
};

export const validateCodeword = (codeword: string) => {
  if (!codeword || codeword.length < 3 || codeword.length > 20) {
    throw new ValidationError("Codeword must be between 3 and 20 characters");
  }

  if (!/^[a-zA-Z0-9-_]+$/.test(codeword)) {
    throw new ValidationError(
      "Codeword can only contain letters, numbers, hyphens and underscores"
    );
  }
};
