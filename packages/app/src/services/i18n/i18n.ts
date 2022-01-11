import { isEmpty } from "@/utils";

const Regex = /%[a-zA-Z-_]+%/;

export enum LanguageCode {
  EN = "en",
  ZH_CN = "zh-CN"
}

export const Language: { [name: string]: string } = {
  [LanguageCode.EN]: "English",
  [LanguageCode.ZH_CN]: "简体中文"
};

function interploateText(text: string, data: any) {
  const includesVariable = text.match(Regex);

  if (!includesVariable || isEmpty(data)) {
    return text;
  }

  let interpolatedText = text;

  Object.keys(data).forEach(dataKey => {
    const templateKey = new RegExp(`%${dataKey}%`, "g");
    interpolatedText = interpolatedText.replace(templateKey, data[dataKey]);
  });

  return interpolatedText;
}

export function i18nFactory(dict: Record<string, string> = {}) {
  return function i18n(
    key: string | number,
    text: string,
    data: any = {}
  ): string {
    const translationText = dict[key];
    if (!translationText) {
      return interploateText(text, data);
    }

    return interploateText(translationText, data);
  };
}
