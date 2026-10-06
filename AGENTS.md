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

- Load Lottie playback dynamically inside a client effect and destroy it on unmount so browser-only animation code stays outside SSR execution.
- Gate app routes through the root router and verify encrypted access sessions against server-owned key claims so direct URLs cannot bypass the entry screen.
