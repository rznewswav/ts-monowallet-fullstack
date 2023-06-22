import "reflect-metadata";
import { isDefined } from "class-validator";
import { Inject } from "@nestjs/common";
import { providers } from "../config.provider";

type UseConfigType = (name: string, defValue?: any) => ParameterDecorator;
export const UseConfig: UseConfigType = (name, defValue) => {
  return (target, propertyKey, index) => {
    let injectName = "";
    let fn: Function;
    if (isDefined(index)) {
      // is a function param decorator
      injectName = `config:param:${name}:${propertyKey ?? "#constructor"}:${index}`;

      fn = Reflect.getMetadata("design:paramtypes", target, propertyKey)?.[index];
    } else {
      // is a property decorator
      fn = Reflect.getMetadata("design:type", target, propertyKey);
      injectName = `config:property:${name}:${propertyKey}`;
    }

    providers.push({
      defValue,
      fn,
      injectName,
      name
    });

    return Inject(injectName)(target, propertyKey, index);
  };
};
