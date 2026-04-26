var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Mixin } from '../../../../ChronoGraph/class/BetterMixin.js';
import { generic_field } from '../../../../ChronoGraph/replica/Entity.js';
import { ModelReferenceField, injectStaticFieldsProperty, isSerializableEqual } from '../../../chrono/ModelFieldAtom.js';
import { ChronoPartOfProjectModelMixin } from '../mixin/ChronoPartOfProjectModelMixin.js';
/**
 * Base assignment model class. It just contains references to the [[BaseEventMixin|event]] and [[BaseResourceMixin|resource]] being assigned.
 */
export class BaseAssignmentMixin extends Mixin([ChronoPartOfProjectModelMixin], (base) => {
    const superProto = base.prototype;
    class BaseAssignmentMixin extends base {
    }
    __decorate([
        generic_field({
            bucket: 'assigned',
            resolver: function (id) { return this.getEventById(id); },
            modelFieldConfig: {
                serialize: event => event?.id,
                isEqual: isSerializableEqual,
                persist: false
            }
        }, ModelReferenceField)
    ], BaseAssignmentMixin.prototype, "event", void 0);
    __decorate([
        generic_field({
            bucket: 'assigned',
            resolver: function (id) { return this.getResourceById(id); },
            modelFieldConfig: {
                serialize: resource => resource?.id,
                isEqual: isSerializableEqual,
                persist: false
            }
        }, ModelReferenceField)
    ], BaseAssignmentMixin.prototype, "resource", void 0);
    // inject "fields" getter override to apply "modelFieldConfig" to "event" & "resource" fields
    injectStaticFieldsProperty(BaseAssignmentMixin);
    return BaseAssignmentMixin;
}) {
}
