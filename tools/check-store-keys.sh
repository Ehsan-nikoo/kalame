#!/usr/bin/env bash
# بررسی کلیدهای عمومی (RSA) بازار و مایکت، بدون چاپ خود کلید.
# کلید درست: متن base64 از یک کلید عمومی RSA با قالب X.509 (همان چیزی که پنل فروشگاه می‌دهد).
# با --strict اگر کلیدی خراب باشد (نه خالی) خطا می‌دهد.
strict=0; [ "$1" = "--strict" ] && strict=1
bad=0
declare -A fp
for name in BAZAAR_RSA_KEY MYKET_RSA_KEY; do
  raw="${!name}"
  key="$(printf '%s' "$raw" | tr -d ' \t\r\n')"
  if [ -z "$key" ]; then echo "::warning::$name: خالی است (تنظیم نشده)."; continue; fi
  case "$key" in *BEGIN*|*END*) echo "::error::$name: خطوط BEGIN/END نباید در کلید باشد؛ فقط متن وسط را بگذارید."; bad=1; continue;; esac
  if ! printf '%s' "$key" | base64 -d > /tmp/$name.der 2>/dev/null; then
    echo "::error::$name: متن base64 درستی نیست (شاید ناقص کپی شده)."; bad=1; continue
  fi
  info="$(openssl pkey -pubin -inform DER -in /tmp/$name.der -noout -text 2>/dev/null | head -1)"
  if ! printf '%s' "$info" | grep -q "Public-Key"; then
    echo "::error::$name: کلید عمومی RSA نیست."; bad=1; continue
  fi
  bits="$(printf '%s' "$info" | grep -o '[0-9]\+ bit')"
  fp[$name]="$(sha256sum /tmp/$name.der | cut -c1-12)"
  echo "$name: درست است — RSA $bits، ${#key} نویسه، اثر انگشت ${fp[$name]}"
  rm -f /tmp/$name.der
done
if [ -n "${fp[BAZAAR_RSA_KEY]}" ] && [ "${fp[BAZAAR_RSA_KEY]}" = "${fp[MYKET_RSA_KEY]}" ]; then
  echo "::error::کلید بازار و مایکت یکی است؛ هر فروشگاه کلید خودش را دارد."; bad=1
fi
[ $strict = 1 ] && [ $bad = 1 ] && exit 1
exit 0
