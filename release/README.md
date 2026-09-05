# DSH release path

Pushing `release/next` automatically starts candidate qualification. The pushed commit must contain `release/request.json` with the exact `candidate_tag`; the workflow has no manual or reusable candidate entry point.

Stable promotion remains manual-only. It verifies and publishes the exact qualified candidate package bytes, then creates the final GitHub Release without rebuilding.
