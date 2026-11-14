# Administrator video library

Deploy the generated EducationalVideos.gs with the authenticated Apps Script package. The configured administrator manages up to 30 shared video entries. Every write calls requireAccountAdmin_; learners can only read through withAuth_ and play. Video IDs are validated server-side. YouTube links are reduced to a validated ID and embedded with no autoplay; branding, recommendations, ads and embedding availability remain controlled by YouTube. No user-submitted links or local editing mode exists.

The public GitHub Pages preview has no connected shared catalogue and shows an explicit unavailable message. Do not claim this feature is operational there until authenticated backend hosting is activated. Google whitelist activation remains a separate deployment task.
