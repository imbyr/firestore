import { Type } from './type';
import { Metadata } from './metadata';

/**
 * Decorate property as firebase document reference.
 *
 * Example:
 *
 * @Document('employees')
 * class Employee {
 *   id: string;
 * }
 *
 * @Document('tasks')
 * class Task {
 *   id: string;
 *   name: string;
 *
 *   @Reference(Employee)
 *   employee: Employee;
 * }
 *
 * @param referentType Type of referent document.
 */
export function Reference<T extends object>(referentType: Type<T>) {
  return ({ constructor: documentType }: object, propertyKey: string) =>
    Metadata.addReference(documentType as Type, propertyKey, referentType);
}
