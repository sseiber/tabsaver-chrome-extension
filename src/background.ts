async function polling() {
    const storageEstimate = await navigator.storage.estimate();
    console.log(`Using ${storageEstimate.usage} out of ${storageEstimate.quota} bytes.`);

    setTimeout(polling, 1000 * 5);
}

void polling();
