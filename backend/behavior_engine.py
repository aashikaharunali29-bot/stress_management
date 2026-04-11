def analyze_behavior(behavior):
    if not behavior:
        return 0.0

    score = 0

    if behavior.response_time > 5:
        score += 1

    if behavior.click_count > 20:
        score += 1

    return score / 2