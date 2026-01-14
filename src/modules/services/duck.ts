/**
 * Example Translation Service Template
 *
 * This file is a template for adding a new translation service.
 * Follow the instructions below to create your own service.
 *
 * === How to use this template ===
 *
 * 1. **Copy this file** to `src/services/<your-service-id>.ts`
 *    - The filename should match your `id` field (e.g. `google-translate.ts` for id `"google-translate"`).
 *
 * 2. **Fill in the required fields:**
 *    - `id` (string, required): A unique identifier for your service.
 *      Use lowercase letters and `-` only (e.g. `"google-translate"`).
 *    - `type` (required): `"word"` or `"sentence"`.
 *      Choose `"word"` for dictionary-like results, `"sentence"` for full-text translations.
 *    - `translate` (required): The function that sends the request to your translation API
 *      and writes the result into `data.result`.
 *
 * 3. **Optional fields:**
 *    - `name` (string): The display name of your service.
 *      Defaults to `getString("service-${id}")` if omitted.
 *    - `helpUrl` (string): A link to your service's documentation.
 *      If provided, a "Help" button will appear in the settings panel to open this URL.
 *    - `defaultSecret` (string): A placeholder API key or credentials format.
 *      Only set if your service requires authentication.
 *    - `secretValidator(secret)`: Function to validate the secret format and provide hints.
 *    - `config(settings)`: Function to add extra user-configurable settings (e.g. endpoint, model).
 *      Omit if no additional settings are required.
 *    - `requireExternalConfig`: Indicate whether the service requires external configuration (e.g. Pull Docker images or install softwares) and whether a 📍 label is added after the service name.
 *      Omit if no external configuration is required.
 *
 * 4. **If your service requires an API key (secret):**
 *    - Uncomment `defaultSecret` and `secretValidator` in the example below.
 *    - The `secretValidator` should return a `SecretValidateResult` object describing:
 *        - The parsed secret value
 *        - Whether it is valid
 *        - Any hints or errors for the user
 *
 * 5. **If your service has custom settings:**
 *    - Implement `config(settings)` using the methods from `AllowedSettingsMethods`.
 *    - These methods let you add input fields, checkboxes, selects, etc., in the settings dialog.
 *    - Example:
 *      ```ts
 *      config(settings) {
 *        settings
 *          .addTextSetting({ prefKey: "endpoint", nameKey: "service-myapi-endpoint" })
 *          .addSelectSetting({
 *            prefKey: "model",
 *            nameKey: "service-myapi-model",
 *            options: [
 *              { label: "Model A", value: "a" },
 *              { label: "Model B", value: "b" }
 *            ]
 *          });
 *      }
 *      ```
 *
 * 6. **If your service requires external configuration:**
 *    - Uncomment `requireExternalConfig` in the example below.
 *
 * 7. **Register your service:**
 *    - Open `services/index.ts` and add your new service object to the `register` array.
 *
 * 8. **Test your service** in the UI to ensure:
 *    - The settings panel works as expected
 *    - Secrets are validated correctly
 *    - Translation requests succeed and results are displayed
 */

import { getPref } from "../../utils";
import { TranslateService } from "./base";

export const Duck: TranslateService = {
  id: "duck",
  type: "word",
  helpUrl: "http://1.116.120.75:8081/",

  // === Optional: API key / secret support ===
  // Uncomment if your service requires a secret
  /*
  defaultSecret: "accessKeyId#accessKeySecret",
  secretValidator(secret) {
    const parts = secret?.split("#");
    const flag = parts.length === 2;
    const partsInfo = `AccessKeyId: ${parts[0]}\nAccessKeySecret: ${parts[1]}`;
    return {
      secret,
      status: flag && secret !== ExampleTranslationService.defaultSecret,
      info:
        secret === ExampleTranslationService.defaultSecret
          ? "The secret is not set."
          : flag
            ? partsInfo
            : `The secret must have 2 parts joined by '#', but got ${parts?.length}.\n${partsInfo}`,
    };
  },
  */

  // === REQUIRED: translation function ===
  async translate(data) {
    // Get saved settings
    const option1 = getPref("options1");

    // curl 'http://1.116.120.75:8083/v1/translate?text=insist' \
    //   -H 'Accept: application/json, text/plain, */*' \
    //   -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' \
    //   -H 'Cache-Control: no-cache' \
    //   -H 'Connection: keep-alive' \
    //   -H 'Origin: http://1.116.120.75:8081' \
    //   -H 'Pragma: no-cache' \
    //   -H 'Referer: http://1.116.120.75:8081/' \
    //   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36' \
    //   --insecure
    const { raw: text } = data;
    const APIURL = "http://1.116.120.75:8083/v1/translate";

    // Send request to translation API
    const xhr = await Zotero.HTTP.request("GET", `${APIURL}?text=${text}`, {
      headers: {
        "Content-Type": "application/json",
      },
      body: "",
      responseType: "json",
    });

    // Handle HTTP errors
    if (xhr?.status !== 200) {
      throw `Request error: ${xhr?.status}`;
    }

    // // Handle API errors
    // if (xhr.response.Code !== "200") {
    //   throw `Service error: ${xhr.response.Code}:${xhr.response.Message}`;
    // }

    // Save the translation result
    data.result = formatTranslationResult(xhr.response);
  },

  // === Optional: custom settings in preferences ===
  // Uncomment if your service requires extra settings
  /*
  config(settings) {
    settings.addTextSetting({
      prefKey: "example",
      nameKey: "example",
    });
  }, 
  */

  // === Optional: 📍 label in service name ===
  // Uncomment if your service requires external configuration
  /*
   * requireExternalConfig: true;
   */
};

/**
 * Format translation result to user-readable string
 */
function formatTranslationResult(response: any): string {
  const lines: string[] = [];

  // Pronunciation
  if (response.ukphone || response.usphone) {
    const pronounceParts = [];
    if (response.ukphone) pronounceParts.push(`英: ${response.ukphone}`);
    if (response.usphone) pronounceParts.push(`美: ${response.usphone}`);
    lines.push(pronounceParts.join(" "));
  }

  // Translations
  if (response.translations?.length) {
    lines.push(`翻译: ${response.translations.join("; ")}`);
  }

  // Word forms
  if (response.word_forms?.length) {
    lines.push(`词形变化: ${response.word_forms.join("; ")}`);
  }

  // Etymologies
  if (response.etymologies?.length) {
    lines.push("词源:");
    response.etymologies.forEach((etym: any, index: number) => {
      let etymLine = `  ${index + 1}. ${etym.value}`;
      if (etym.desc) etymLine += ` (${etym.desc})`;
      lines.push(etymLine);
    });
  }

  // Example sentences
  if (response.eg_sentences?.length) {
    lines.push("例句:");
    response.eg_sentences.forEach((eg: any) => {
      lines.push(`  • ${eg.sentence}`);
      lines.push(`    → ${eg.translation}`);
    });
  }

  // Discrimination
  if (response.discrimination?.length) {
    lines.push("词语辨析:");
    response.discrimination.forEach((discrim: any) => {
      lines.push(`  • ${discrim.headword}: ${discrim.usage}`);
    });
  }

  return lines.join("\n\n");
}
