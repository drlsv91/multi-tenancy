import { ValidationError, getMetadataStorage } from 'class-validator';
import { Path } from 'nestjs-i18n';
import { replacements } from './validation';
import { ValidationPipe } from '@nestjs/common';

const prefix = '~~~~ translate ~~~~';
const delimiter = ':::::';

type ResolveResult = {
  key: string;
  args?: Record<string, any>;
};

export const translate = <K>(key: Path<K>, args?: Record<string, any>) => {
  return `${prefix}${key}${args ? delimiter + JSON.stringify(args) : ''}`;
};

const isTranslationKey = (key: string) => {
  const regex = new RegExp(`^(.+\.)?${prefix}(.+)$`);
  const match = key?.match(regex);
  return match;
};

export const resolveTranslation = (template: string): ResolveResult | null => {
  const match = isTranslationKey(template);

  if (!match) return null;
  let argsString, key;
  const end = match.pop();
  if (end) {
    [key, argsString] = end.split(delimiter);
  }

  return { key, args: JSON.parse(argsString || 'null') };
};

export const transformValidationConstraintMessages = (
  errors: ValidationError[],
) => {
  return errors.map(({ property, constraints, children, target, ...rest }) => {
    constraints = translateConstraintMessages(property, target!, constraints!);

    children = children?.map((child) => {
      translateChildConstraintMessages(child, property);

      return child;
    });

    return { property, constraints, children, ...rest };
  });
};

const translateChildConstraintMessages = (
  child: ValidationError,
  parentProperty: string,
) => {
  child.constraints = translateConstraintMessages(
    `${parentProperty}.${child.property}`,
    child.target!,
    child.constraints!,
  );

  if (child.children) {
    child.children.forEach((c, index) => {
      translateChildConstraintMessages(c, `${parentProperty}.${index}`);
    });
  }
};

const translateConstraintMessages = (
  property: string,
  target: object,
  constraints: { [type: string]: string },
) => {
  const updatedConstraints: { [type: string]: string } = {};
  const metadata = getMetadataStorage().getTargetValidationMetadatas(
    target.constructor,
    target.constructor.name,
    true,
    false,
  );

  Object.entries(constraints || []).forEach(([key, value]) => {
    const replacementValue = replacements[key];
    const meta = metadata.find(
      (x) => x.name === key && x.propertyName === property.split('.').pop(),
    );

    const { constraints: validationConstraints, message } = meta || {};

    // set to default validator message
    let translationKey = value;

    // Override if value is the decorator's default message.
    // We know this is the case when `message` is missing
    // in the validation metadata.
    if (!message && replacementValue) {
      translationKey = translate(replacementValue, {
        property,
        constraints: validationConstraints,
      });
    }

    updatedConstraints[key] = translationKey;
  });

  return updatedConstraints;
};

export const validationPipe = new ValidationPipe({ transform: true });

export const validationExceptionsFactory = (errors: ValidationError[]) => {
  const formattedErrors = validationPipe.createExceptionFactory()(
    transformValidationConstraintMessages(errors),
  );

  return formattedErrors;
};

/**
 * Class validator's `isEnum` decorator
 * expects an object but there are situations
 * where you would rather pass an array instead.
 * This function converts a array of typed
 * values into an object.
 * @param items Array<any>
 * @returns Object
 */
export const convertArrayToEnumObjectType = (items: readonly any[]) => {
  return items.reduce((acc, exp) => {
    // due to the implementation details of isEnum,
    // appending an alphabet to object's keys makes
    // sure that isNaN(parseInt(key)) returns true
    acc['a' + exp.toString().replace(/[\W]/g, '_')] = exp;
    return acc;
  }, {});
};
