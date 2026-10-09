<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Gallery uploads use bounded upload-and-save batches without a total count cap and store the original File, so large selections remain reliable without image transformation.
- Gallery album reads page through photo rows with explicit publication filtering and stable ordering, so large albums are complete and drafts stay hidden even for signed-in administrators.
- Password reset operations verify administrator roles through the authenticated client before privileged account changes and verify the exact account email, so reset requests cannot target unintended accounts.
