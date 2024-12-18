
import {IS_LOG, IS_PROFILE} from './flags';

export function log(message: string, ...args: any[]) {
  if (IS_LOG) {
    let length = args ? args.length : 0;
    if (length > 0) {
      console.log(message, ...args);
    } else {
      console.log(message);
    }
  }
};

// check to see if native support for profiling is available.
const NATIVE_PROFILE_SUPPORT =
    typeof window !== 'undefined' && !!window.performance && !!console.profile;

/**
 * A decorator that can profile a function.
 */
export function profile(
    target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  if (IS_PROFILE) {
    return performProfile(target, propertyKey, descriptor);
  } else {
    // return as-is
    return descriptor;
  }
}

function performProfile(
    target: any, propertyKey: string,
    descriptor: PropertyDescriptor): PropertyDescriptor {
  let originalCallable = descriptor.value;
  // name must exist
  let name = originalCallable.name;
  if (!name) {
    name = 'anonymous function';
  }
  if (NATIVE_PROFILE_SUPPORT) {
    descriptor.value = function(...args: any[]) {
      console.profile(name);
      let startTime = window.performance.now();
      let result = originalCallable.call(this || window, ...args);
      let duration = window.performance.now() - startTime;
      console.log(`${name} took ${duration} ms`);
      console.profileEnd();
      return result;
    };
  } else {
    descriptor.value = function(...args: any[]) {
      log(`Profile start ${name}`);
      let start = Date.now();
      let result = originalCallable.call(this || window, ...args);
      let duration = Date.now() - start;
      log(`Profile end ${name} took ${duration} ms.`);
      return result;
    };
  }
  return descriptor;
}
