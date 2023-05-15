/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useEffect} from 'react';
import { useState } from 'react';

type Props = {
  defaultSelection?: 'rootStart' | 'rootEnd';
  isSelected: boolean
};

export function TextFocusPlugin({defaultSelection, isSelected}: Props): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (isSelected){
        editor.focus(
            () => {
              // If we try and move selection to the same point with setBaseAndExtent, it won't
              // trigger a re-focus on the element. So in the case this occurs, we'll need to correct it.
              // Normally this is fine, Selection API !== Focus API, but fore the intents of the naming
              // of this plugin, which should preserve focus too.
              const activeElement = document.activeElement;
              const rootElement = editor.getRootElement() as HTMLDivElement;
              if (
                rootElement !== null &&
                (activeElement === null || !rootElement.contains(activeElement))
              ) {
                // Note: preventScroll won't work in Webkit.
                rootElement.focus({preventScroll: true});
              }
            },
            {defaultSelection},
          );
    } else {
        editor.blur()
    }
  }, [defaultSelection, editor, isSelected]);

  return null;
}