const shareService = require('../services/share.service');
const { success, created, fail } = require('../utils/apiResponse');

// ── Helpers ────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN_RE = /^[0-9a-f]{64}$/i;

// ═══════════════════════════════════════════════════════
// OWNER ENDPOINTS (authenticated, under /api/trips/:tripId/share)
// ═══════════════════════════════════════════════════════

// ── POST /api/trips/:tripId/share ──────────────────────

const createShare = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!UUID_RE.test(tripId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID format.',
      });
    }

    const share = await shareService.createShare(tripId, req.user.id);

    return created(res, {
      message: 'Share link created successfully.',
      data: { share },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/trips/:tripId/share ───────────────────────

const getShare = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!UUID_RE.test(tripId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID format.',
      });
    }

    const share = await shareService.getShare(tripId, req.user.id);

    if (!share) {
      return fail(res, {
        statusCode: 404,
        message: 'No share link exists for this trip.',
      });
    }

    return success(res, {
      message: 'Share link retrieved successfully.',
      data: { share },
    });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/trips/:tripId/share ─────────────────────

const updateShare = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!UUID_RE.test(tripId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID format.',
      });
    }

    const { is_active } = req.body;

    if (is_active === undefined || typeof is_active !== 'boolean') {
      return fail(res, {
        statusCode: 400,
        message: 'is_active (boolean) is required.',
      });
    }

    const share = await shareService.updateShare(tripId, req.user.id, { is_active });

    return success(res, {
      message: `Share link ${is_active ? 'activated' : 'deactivated'} successfully.`,
      data: { share },
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/trips/:tripId/share ────────────────────

const deleteShare = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!UUID_RE.test(tripId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID format.',
      });
    }

    const deleted = await shareService.deleteShare(tripId, req.user.id);

    if (!deleted) {
      return fail(res, {
        statusCode: 404,
        message: 'No share link exists for this trip.',
      });
    }

    return success(res, {
      message: 'Share link deleted permanently.',
    });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════
// PUBLIC ENDPOINTS (no auth required)
// ═══════════════════════════════════════════════════════

// ── GET /api/public/trips/:token ───────────────────────

const getPublicTrip = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!TOKEN_RE.test(token)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid share token format.',
      });
    }

    const itinerary = await shareService.getPublicTrip(token);

    return success(res, {
      message: 'Public itinerary retrieved successfully.',
      data: itinerary,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/public/trips/:token/copy ─────────────────

const copyPublicTrip = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!TOKEN_RE.test(token)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid share token format.',
      });
    }

    const trip = await shareService.copyPublicTrip(token, req.user.id);

    return created(res, {
      message: 'Trip copied to your account successfully.',
      data: { trip },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createShare,
  getShare,
  updateShare,
  deleteShare,
  getPublicTrip,
  copyPublicTrip,
};
