
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  isLogin?: boolean;
}

interface LoginFormValues {
  username: string;
  password: string;
}

interface RegisterFormValues extends LoginFormValues {
  nickname: string;
}

export function AuthForm({ isLogin = true }: AuthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  const { register: registerField, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    defaultValues: {
      username: "",
      password: "",
      nickname: ""
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    let success = false;

    try {
      if (isLogin) {
        success = await login(data.username, data.password);
      } else {
        success = await register(data.username, data.password, data.nickname);
      }
      
      if (success) {
        navigate(isLogin ? "/dashboard" : "/onboarding/sleep/1");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="nickname">닉네임</Label>
          <Input
            id="nickname"
            type="text"
            {...registerField("nickname", { 
              required: "닉네임을 입력해주세요",
              minLength: { value: 2, message: "닉네임은 2자 이상이어야 합니다" },
              maxLength: { value: 15, message: "닉네임은 15자 이하여야 합니다" }
            })}
            className="bg-white/50 backdrop-blur-sm"
            placeholder="닉네임을 입력하세요"
          />
          {errors.nickname && (
            <p className="text-sm text-destructive">{errors.nickname.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="username">아이디</Label>
        <Input
          id="username"
          type="text"
          {...registerField("username", { 
            required: "아이디를 입력해주세요",
            minLength: { value: 4, message: "아이디는 4자 이상이어야 합니다" },
            maxLength: { value: 20, message: "아이디는 20자 이하여야 합니다" },
            pattern: { value: /^[a-z0-9]+$/, message: "아이디는 영문 소문자와 숫자만 사용 가능합니다" }
          })}
          className="bg-white/50 backdrop-blur-sm"
          placeholder="아이디를 입력하세요"
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          {...registerField("password", { 
            required: "비밀번호를 입력해주세요",
            minLength: { value: 8, message: "비밀번호는 8자 이상이어야 합니다" }
          })}
          className="bg-white/50 backdrop-blur-sm"
          placeholder="비밀번호를 입력하세요"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "처리 중..." : isLogin ? "로그인" : "가입하기"}
      </Button>
    </form>
  );
}
