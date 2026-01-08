# Docker 사용 가이드

## 보안 주의사항

**⚠️ 중요: `.env` 파일은 Docker 이미지에 절대 포함하지 않습니다!**

환경 변수는 다음 방법으로 주입해야 합니다:

## 1. Docker Compose 사용 (로컬 개발)

```bash
docker-compose up -d
```

환경 변수는 `docker-compose.yml`의 `environment` 섹션에서 관리됩니다.

## 2. Docker Run으로 환경 변수 주입

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret-key" \
  -e JWT_EXPIRATION="7d" \
  -e PORT="3000" \
  -e NODE_ENV="production" \
  your-dockerhub-username/nestjs-graphql-app:latest
```

## 3. 환경 변수 파일 사용 (안전한 방법)

### 3-1. `.env.prod` 파일 생성 (Git에 추가하지 않음)

```bash
# .env.prod
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-production-secret
JWT_EXPIRATION=7d
PORT=3000
NODE_ENV=production
```

### 3-2. Docker Run에서 사용

```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env.prod \
  your-dockerhub-username/nestjs-graphql-app:latest
```

## 4. 프로덕션 환경별 권장 방법

### AWS (ECS/Fargate)
```bash
# AWS Secrets Manager 사용
aws secretsmanager create-secret \
  --name nestjs-graphql/prod/env \
  --secret-string file://.env.prod
```

Task Definition에서 환경 변수로 주입:
```json
{
  "secrets": [
    {
      "name": "DATABASE_URL",
      "valueFrom": "arn:aws:secretsmanager:region:account:secret:nestjs-graphql/prod/env:DATABASE_URL::"
    }
  ]
}
```

### Kubernetes
```bash
# Secret 생성
kubectl create secret generic nestjs-graphql-env \
  --from-env-file=.env.prod

# Deployment에서 사용
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: app
        envFrom:
        - secretRef:
            name: nestjs-graphql-env
```

### Google Cloud Run
```bash
gcloud run deploy nestjs-graphql-app \
  --image gcr.io/project/nestjs-graphql-app \
  --set-env-vars DATABASE_URL="..." \
  --set-env-vars JWT_SECRET="..."
```

### Azure Container Instances
```bash
az container create \
  --resource-group myResourceGroup \
  --name nestjs-graphql-app \
  --image your-registry/nestjs-graphql-app:latest \
  --environment-variables \
    DATABASE_URL="..." \
    JWT_SECRET="..."
```

## 5. Docker Hub에 이미지 푸시

```bash
# 이미지 빌드
docker build -t your-username/nestjs-graphql-app:latest .

# 이미지 확인 (.env가 포함되지 않았는지 확인)
docker run --rm -it your-username/nestjs-graphql-app:latest sh
# 컨테이너 안에서: ls -la (여기에 .env가 없어야 함)

# Docker Hub 로그인
docker login

# 이미지 푸시
docker push your-username/nestjs-graphql-app:latest
```

## 6. 이미지 보안 검증

```bash
# 이미지 레이어 확인
docker history your-username/nestjs-graphql-app:latest

# 이미지 내부 파일 확인
docker run --rm -it your-username/nestjs-graphql-app:latest sh -c "find / -name .env 2>/dev/null"
# 결과가 없어야 함!

# Trivy로 보안 스캔
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image your-username/nestjs-graphql-app:latest
```

## 7. CI/CD 파이프라인 예시

### GitHub Actions

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Build Docker image
      run: docker build -t ${{ secrets.DOCKER_USERNAME }}/nestjs-graphql-app:latest .

    - name: Login to Docker Hub
      run: echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin

    - name: Push image
      run: docker push ${{ secrets.DOCKER_USERNAME }}/nestjs-graphql-app:latest
```

**환경 변수는 GitHub Secrets에 저장하고 배포 시 주입합니다.**

## 8. 보안 체크리스트

- [ ] `.env` 파일이 `.dockerignore`에 포함되어 있는가?
- [ ] Dockerfile에서 `.env`를 COPY하지 않는가?
- [ ] `.gitignore`에 `.env`가 포함되어 있는가?
- [ ] 프로덕션 환경 변수가 안전한 곳에 저장되어 있는가?
- [ ] JWT_SECRET이 강력한가? (최소 32자 이상)
- [ ] Docker 이미지에 불필요한 파일이 포함되지 않았는가?

## 9. 문제 해결

### 환경 변수가 제대로 주입되지 않는 경우

```bash
# 컨테이너 내부 환경 변수 확인
docker exec -it container_name env | grep DATABASE_URL

# 로그 확인
docker logs container_name
```

### Prisma 마이그레이션 실패

```bash
# 수동으로 마이그레이션 실행
docker exec -it container_name npx prisma migrate deploy
```

## 요약

**절대 하지 말 것**: ❌
- Docker 이미지에 `.env` 파일 포함
- 하드코딩된 비밀 키
- 공개 저장소에 환경 변수 노출

**반드시 할 것**: ✅
- 환경 변수는 런타임에 주입
- Secrets Manager 사용
- 정기적인 보안 스캔
- 환경별로 다른 비밀 키 사용
