# 📑 Contributing Guide

## ✍️ Commit Message Convention

Tüm commit mesajları **Conventional Commits** standardına uygun olmalıdır.  
Format:

<type>(scope): <short summary>

Kod

### 🔧 Types
- **feat** → Yeni özellik ekleme  
- **fix** → Hata düzeltme  
- **chore** → Build, config, dependency güncellemeleri  
- **docs** → Dokümantasyon değişiklikleri  
- **test** → Test ekleme veya güncelleme  
- **refactor** → Kodun davranışını değiştirmeden iyileştirme  
- **style** → Formatlama, whitespace, lint düzeltmeleri  
- **perf** → Performans iyileştirmeleri  
- **ci** → CI/CD pipeline değişiklikleri  

### 🎯 Examples
```bash
feat(auth): implement JWT strategy with refresh tokens
fix(client): correct relation mapping with dietitian
docs(readme): add setup instructions for local development
chore(deps): update prisma to v7.2.0
test(user): add integration tests for user repository
refactor(dietplan): extract nutritional calculation into domain service
📋 Rules
Scope → İlgili module veya package adı (auth, client, dietplan, docs, ci)

Summary → Kısa, emir kipinde, max 72 karakter

Body (opsiyonel) → Detaylı açıklama, breaking changes, migration notları

Footer (opsiyonel) → Issue veya PR referansı (Closes #123)

✅ Pull Request Checklist
[ ] Commit mesajları convention’a uygun

[ ] Testler eklendi ve geçiyor

[ ] CI pipeline başarılı

[ ] Dokümantasyon güncellendi
