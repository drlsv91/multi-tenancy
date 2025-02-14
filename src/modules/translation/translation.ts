import { copyFileSync, readdirSync } from 'fs';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { getConfig } from '../config/i18n';

type ModuleOptions = {
  loaderPath: string;
  typesOutputPath: string;
};

export const getTranslationModule = async ({
  typesOutputPath,
  loaderPath,
}: ModuleOptions) => {
  const { watch } = getConfig();

  return I18nModule.forRoot({
    fallbackLanguage: 'en',
    fallbacks: {
      'en-*': 'en',
      'fr-*': 'fr',
    },
    loaderOptions: {
      path: loaderPath,
      watch,
    },
    typesOutputPath,
    resolvers: [
      { use: QueryResolver, options: ['lang', 'locale', 'l'] },
      new HeaderResolver(['x-custom-lang']),
      AcceptLanguageResolver,
      new CookieResolver(['lang', 'locale', 'l']),
    ],
  });
};
/* eslint-enable @typescript-eslint/naming-convention */

export const copyValidationFiles = async (destinationPath: string) => {
  const parentDir = path.join(__dirname, 'files');

  const dirs = readdirSync(parentDir, { withFileTypes: true });
  const languageDirs = dirs.filter((x) => x.isDirectory()).map((y) => y.name);

  try {
    for (const dir of languageDirs) {
      const destination = path.join(destinationPath, dir);
      const sourceFileDir = path.join(parentDir, dir);

      const fileNames = readdirSync(sourceFileDir).filter((x) =>
        x.endsWith('.json'),
      );
      for (const fileName of fileNames) {
        const sourceFilePath = path.join(sourceFileDir, fileName);
        const destinationFilePath = path.join(destination, fileName);
        copyFileSync(sourceFilePath, destinationFilePath);
      }
    }
  } catch (error) {
    console.error(error);
  }
  console.log('done.');
};
