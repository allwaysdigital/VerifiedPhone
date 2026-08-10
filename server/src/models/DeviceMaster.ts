import { Schema, model } from 'mongoose';

// Global catalog of known device specs keyed by IMEI TAC (first 8 digits).
// Not shop-scoped — "Galaxy S23 has 8GB RAM" isn't shop-specific data.
// Grows organically as purchases are saved; no seeding, starts empty.
// Deliberately has no `color` field: color is a physical-unit attribute,
// not a device-spec constant, so it's never cached or auto-filled.
//
// `fullSpecs` mirrors services/deviceLookup/types.ts's NormalizedDeviceSpecs
// (minus imei/color/source) as a flexible blob — the richer spec set is still
// evolving as lookup providers change, so a rigid nested schema would fight
// that. brand/model/ram/storage stay as real top-level fields since they're
// what the current Add Purchase UI actually reads and queries.
const deviceMasterSchema = new Schema(
  {
    tac: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    ram: { type: String, default: '' },
    storage: { type: String, default: '' },
    source: { type: String, enum: ['manual', 'deviceatlas', 'imei-info'], default: 'manual' },
    fullSpecs: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

export const DeviceMaster = model('DeviceMaster', deviceMasterSchema);
